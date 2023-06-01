const themeTransition = {
  transition: 'background-color 0.5s linear',
}
const landingPage = {
  light: {
    text: '#FFFFFF',
    backgroundImage: 'url("images/landingInvert.webp")',
    landingHero: 'url("images/landingHeroInvert.png")',
  },
  dark: {
    text: '#262c2e',
    backgroundImage: 'url("images/landing.webp")',
    landingHero: 'url("images/landingHero.svg")',
  },
}

export const lightTheme = {
  body: '#171A23',
  text: '#FFFFFF',
  lightText: '#c9c9cb',
  fontFamily: "'Source Sans Pro', sans-serif",
  boxShadow: 'rgb(255 255 255 / 6%) 0px 4px 20px',
  opacity: '0.8',
  bodyRgba: '252, 2546,244',
  textRgba: 'rgba(54, 53, 55, 0.7)',
  color: 'orange',
  buttonColor: '#c9c9cb',
  projectDesc: '#171A23',
  backgroundSize: 'cover',
  projectCardFontWeight: '300',
  projectCardPaddingOuter: '0rem',
  projectCardPaddingInner: '1rem',
  moreProjectsCardBackgroundColor: '#1f232f',
  themeTransition: themeTransition,
  navbar: {
    // body: '#0a192f',
    body: '#171A23',
    // text: '#E2E2E2',
    text: '#FFF',
    border: '1px solid #FFF',
  },
  landingPage: landingPage.light,
}

export const darkTheme = {
  body: '#FFFFFF',
  text: '#404040',
  lightText: '#404040',
  projectDesc: '#FFFFFF',
  boxShadow: 'rgb(0 0 0 / 10%) 0px 4px 20px',
  opacity: '1',
  buttonColor: '#2f2f2f',
  fontFamily: "'Source Sans Pro', sans-serif",
  backgroundSize: 'contain',
  projectCardPaddingOuter: '1rem',
  projectCardPaddingInner: '0rem',
  projectCardFontWeight: '500',

  moreProjectsCardBackgroundColor: '#FFFFFF',
  textRgba: '252, 2546,244',
  bodyRgba: 'rgba(54, 53, 55, 0.7)',
  themeTransition: themeTransition,
  navbar: {
    body: '#FFF',
    text: '#0e1111',
    border: '1px solid #000',
  

  },
  landingPage: landingPage.dark,
}
