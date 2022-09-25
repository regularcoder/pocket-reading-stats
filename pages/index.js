import Head from 'next/head'
import Link from 'next/link'
import Header from '@components/Header'
import Footer from '@components/Footer'
import Cookies from 'cookies'

export default function Home() {

  return (
    <div className="container">
      <Head>
        <title>Next.js Starter!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Welcome to my app!" />
        <p className="description">
          
        <Link href="/start-auth">
          <a>Authorise</a>
        </Link>
        </p>
      </main>
      <Footer />
    </div>
  )
}

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const code = cookies.get('access-token');

  if (!code) {
    return {
      redirect: {
        destination: '/start-auth',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}