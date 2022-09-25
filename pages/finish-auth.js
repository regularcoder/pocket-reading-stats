import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import Cookies from 'cookies'

export default function FinishAuth({ code }) {
  return (
    <div className="container">
      <Head>
        <title>Success</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Login completed" />
      </main>
      <Footer />
    </div>
  )
}

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const code = cookies.get('temp-auth-code');

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: `{"consumer_key":"${process.env.POCKET_CONSUMER_KEY}","code":"${code}"}`
  };
  
  const oauth_response = await fetch(`https://getpocket.com/v3/oauth/authorize`, options);

  const data = await oauth_response.formData();
  const access_token = data.get('access_token');

  cookies.set('access-token', access_token);
  cookies.set('temp-auth-code');

  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  }
}