import Cookies from 'cookies'
import { useEffect, useState } from 'react'

export default function Home({ list }) {
  const [wordsInWeek, setWordsInWeek] = useState(0);
  
  useEffect(() => {
    let wordsInPeriod = 0;

    Object.entries(list).forEach(([, value]) => {
      wordsInPeriod += Number(value.word_count);
    });

    setWordsInWeek(wordsInPeriod);
  });


  return (
    <div>
      <h2>Articles read in past 7 days</h2>
      Total words: {wordsInWeek}<br/><br/>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Words</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(list).map(([key, value]) => {
            return <tr key={value.item_id}>
              <td>{value.resolved_title || value.given_title}</td>
              <td>{value.word_count}</td>
            </tr>
          })}
        </tbody>
      </table>
    </div>
  )
}

function lastWeek() {
  var today = new Date();
  var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
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

  return {
    props: { list: json_response.list },
  }
}