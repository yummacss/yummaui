/** Where the site keeps the reader's theme. */
export const THEME_KEY = "yui:theme";

/** Runs in the head before the first paint, so a picked theme never flashes the other. */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
