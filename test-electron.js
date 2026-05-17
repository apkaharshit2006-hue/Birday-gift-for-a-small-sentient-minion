const { app, screen } = require('electron');
app.whenReady().then(() => {
  const display = screen.getPrimaryDisplay();
  console.log("workAreaSize:", display.workAreaSize);
  console.log("bounds:", display.bounds);
  app.quit();
});
