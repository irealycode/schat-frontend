import React from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import NF from './404';
import Login from './Login/Login';
import Register from './Register/Register';
import HomeRouter from './Home/HomeRouter';
import Verify from './Verify/Verify';




interface TransProps {
  children: React.ReactNode
}


const PageWrapper : React.FC<TransProps> = ({children}) => {
    return(
      <div style={{backgroundColor:"#121212",width:'100vw',height:'100vh'}} >
        <motion.div style={{backgroundColor:"red"}}  initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:1}} >
          {children}
        </motion.div>
      </div>
    )
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AnimatePresence mode='wait'>
      <Routes>
        <Route path="/" >
        <Route index element={<PageWrapper><HomeRouter /></PageWrapper>} />
        <Route path="/home" element={<PageWrapper><HomeRouter /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/verify" element={<PageWrapper><Verify /></PageWrapper>} />
        <Route path="/register/:email?" element={<PageWrapper><Register /></PageWrapper>} />

        
        {/* <Route path="/product/:jid/sid/:sid" element={<ProdS />} /> */}
        <Route path="*" element={<NF />} />
        </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
};

export default App;