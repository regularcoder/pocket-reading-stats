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
  Block
} from "@tremor/react";

export default function Home({ list }) {
  const [wordsInWeek, setWordsInWeek] = useState(0);

  useEffect(() => {
    let wordsInPeriod = 0;

    list.forEach((value) => {
      wordsInPeriod += Number(value.word_count);
    });

    setWordsInWeek(wordsInPeriod);
  });


  return (
    <div className="m-5 max-w-screen-xl">
      <Title>Reading statistics</Title>
      <Text>Statistics below are for the past 7 days</Text>

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
                {list.map(value => {
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
            <Card>
              <Text>Total words read</Text>
              <Metric>{wordsInWeek}</Metric>
            </Card>
            <Card>
              <Text>Total articles read</Text>
              <Metric>{list.length}</Metric>
            </Card>
          </Block>
        </Col>
      </ColGrid>
    </div>
  )
}

function lastWeek() {
  var today = new Date();
  var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
  return Math.floor(nextweek.getTime() / 1000);
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
      since: lastWeek()
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