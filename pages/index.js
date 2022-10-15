import Cookies from 'cookies'
import { useEffect, useState } from 'react'
import {
  Card, Text, Metric, Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Title,
  ColGrid,
  Col,
  Block,
  Dropdown,
  DropdownItem
} from "@tremor/react";

function lastXDaysTimestamp(days) {
  var today = new Date();
  var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  return Math.floor(nextweek.getTime() / 1000);
}

export default function Home({ list }) {
  const [wordsInWeek, setWordsInWeek] = useState(0);
  const [filteredList, setFilteredList] = useState(list);
  const [durationInDays, setDurationInDays] = useState(0);

  useEffect(() => {
  });

  useEffect(() => {
    const min_date = lastXDaysTimestamp(durationInDays);
    const updated_list = list.filter(a => a.time_read >= min_date);
    
    setFilteredList(updated_list);

    let wordsInPeriod = 0;
    updated_list.forEach((value) => {
      wordsInPeriod += Number(value.word_count);
    });
    setWordsInWeek(wordsInPeriod);
  }, [list, durationInDays, setFilteredList, setWordsInWeek]);

  return (
    <div className="m-5 max-w-screen-xl">
      <Title>Reading statistics</Title>
      <ColGrid numColsLg={6} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
        { /* Main section */}
        <Col numColSpanLg={4}>
          <Card hFull={true}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Title</TableHeaderCell>
                  <TableHeaderCell>Read on</TableHeaderCell>
                  <TableHeaderCell>Words</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredList.map(value => {
                  return <TableRow key={value.item_id}>
                    <TableCell><a href={value.resolved_url || value.given_url} target="_blank">{value.resolved_title || value.given_title}</a></TableCell>
                    <TableCell>{new Date(value.time_read * 1000).toDateString()}</TableCell>
                    <TableCell>{value.word_count}</TableCell>
                  </TableRow>
                })}
              </TableBody>
            </Table>
          </Card>
        </Col>

        { /* KPI sidebar */}
        <Col numColSpanLg={2}>
          <Block spaceY="space-y-6">
            <Card decorationColor='slate' decoration='top'>
              <Text>Select duration</Text>

              <Dropdown
                handleSelect={setDurationInDays}
                marginTop="mt-2"
                placeholder="Render mode"
                defaultValue={7}
              >
                <DropdownItem
                  value={7}
                  text="7 days" />
                <DropdownItem
                  value={30}
                  text="30 days" />
              </Dropdown>
            </Card>
            <Card>
              <Text>Total words read</Text>
              <Metric>{wordsInWeek}</Metric>
            </Card>
            <Card>
              <Text>Total articles read</Text>
              <Metric>{filteredList.length}</Metric>
            </Card>
          </Block>
        </Col>
      </ColGrid>
    </div>
  )
}

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const access_token = cookies.get('access-token');

  if (!access_token) {
    return {
      redirect: {
        destination: '/start-auth',
        permanent: false,
      },
    }
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      consumer_key: process.env.POCKET_CONSUMER_KEY,
      access_token,
      state: 'archive',
      since: lastXDaysTimestamp(60)
    })
  };

  const oauth_response = await fetch(`https://getpocket.com/v3/get`, options);

  const json_response = await oauth_response.json();

  const list = Object
    .entries(json_response.list)
    .map(([, value]) => (value))
    .sort((a, b) => b.time_read.localeCompare(a.time_read));

  return {
    props: { list },
  }
}