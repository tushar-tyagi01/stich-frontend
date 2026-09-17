import React from 'react'
import { Routes, Route } from "react-router-dom";
import Landingpage from './pages/Landingpage';
import Formpage from './pages/Formpage';
import Authform from './forms/Authform';
import ProcessingPage from './pages/Processingpage';
import ResultsPage from './pages/Resultpage';


const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Landingpage/>}/>
      <Route path='/form' element={<Formpage/>}/>
      <Route path='/auth' element={<Authform/>}/>
      <Route path='/processing/:projectId' element={<ProcessingPage/>}/>
      <Route path='/result/:projectId' element={<ResultsPage/>}/>
      
    </Routes>
  )
}

export default App
