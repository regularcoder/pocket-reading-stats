import '@styles/globals.css'
import '@tremor/react/dist/esm/tremor.css';

function Application({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default Application
