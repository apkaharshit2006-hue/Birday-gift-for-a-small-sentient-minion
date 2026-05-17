const { app, screen } = require('electron');
app.whenReady().then(() => {
  const display = screen.getPrimaryDisplay();
  console.log("display keys:", Object.keys(display));
  console.log("workAreaSize:", display.workAreaSize);
  app.quit();
});
