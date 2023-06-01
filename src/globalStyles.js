import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
*,*::before,*::after,h1,h2,h3,h4,h5,h6{
    margin:0;
    padding:0;
    
}
ul, li{
  list-style: none;
  padding: 0;
}
body{
    box-sizing: border-box;
    margin:0;
    padding:0;
    font-family: 'Source Sans Pro', sans-serif;
    /* font-family: 'Inter', sans-serif;   -> FOR LANDING PAGE TEXT*/ 
    /* font-family: 'Roboto Mono', monospace; -> FOR LANDING PAGE TEXT*/
}
`

export default GlobalStyles