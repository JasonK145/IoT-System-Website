import { BrowserRouter, Routes } from 'react-router-dom';
import HomePage from './_index';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <HomePage />
      </Routes>
    </BrowserRouter>
  );
}
  
export default App;