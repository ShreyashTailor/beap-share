export default `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="title" content="%IMAGE_NAME% - BeapShare">
    <meta name="description" content="View this shared image on BeapShare">
    <meta name="theme-color" content="#0A1425">

    <meta property="og:type" content="website">
    <meta property="og:url" content="https://image.beap.studio/api/share/%IMAGE_ID%">
    <meta property="og:title" content="%IMAGE_NAME%">
    <meta property="og:description" content="View this shared image on BeapShare">
    <meta property="og:image" content="%IMAGE_URL%">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="BeapShare">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://image.beap.studio/api/share/%IMAGE_ID%">
    <meta name="twitter:title" content="%IMAGE_NAME%">
    <meta name="twitter:description" content="View this shared image on BeapShare">
    <meta name="twitter:image" content="%IMAGE_URL%">
    
    <title>%IMAGE_NAME% - BeapShare</title>
  </head>
  <body style="background:#0A1425; color:white; display:flex; justify-content:center; align-items:center; height:100vh;">
    <img src="%IMAGE_URL%" alt="%IMAGE_NAME%" style="max-width:90vw; max-height:90vh; border-radius:8px;">
  </body>
</html>
`;