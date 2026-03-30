import './app.css';
import App from './App.svelte';
import { mount } from 'svelte';

// Check if the root element exists
const rootElement = document.getElementById('app');
if (!rootElement) {
  console.error('Root element with id "app" not found!');
  throw new Error('Root element with id "app" not found!');
}

const app = mount(App, {
  target: rootElement
});

console.log('App mounted successfully!');

export default app;