import { Route, Routes } from 'react-router-dom';
import Home from './login';
import UserPage from './user.index';

const App = () =>{
  return (
    <Routes>
      <Route path="/*" element={<Home />}/>
      <Route path='/user' element={<UserPage />}/>
    </Routes>
  );
}

export default App;

