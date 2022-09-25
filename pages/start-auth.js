import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import Cookies from 'cookies'

export default function StartAuth() {
  return (
    <div className="container">
      <Head>
        <title>Something went wrong</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Something went wrong" />
        <p className="description">
          If you are seeing this page then something went wrong.
        </p>
      </main>
      <Footer />
    </div>
  )
}

export async function getServerSideProps({ req, res }) {
  const base_url = process.env.URL ?? "http://localhost:3000"
  const redirect_uri = `${base_url}/finish-auth`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: `{"consumer_key":"${process.env.POCKET_CONSUMER_KEY}","redirect_uri":"${redirect_uri}"}`
  };
  
  const oauth_response = await fetch(`https://getpocket.com/v3/oauth/request`, options);

  const data = await oauth_response.formData();
  const code = data.get('code');

  const cookies = new Cookies(req, res);
  cookies.set('temp-auth-code', code);

  return {
    redirect: {
      destination: `https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=${redirect_uri}`,
      permanent: false,
    },
  };
}