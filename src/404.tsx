import React from 'react';

const NF: React.FC = () => {
  return (
    <div style={{backgroundColor: "#121212",color: "#E0E0E0",height: "111.111111vh",width:'111.11111111vw',display: "flex",flexDirection: "column",alignItems: "center",justifyContent:'center'}}>
      <p style={{color:'white',fontWeight:'500',width:'100%',textAlign:'center',fontSize:'5vw',margin:0}} >404</p>
      <p style={{color:'white',fontWeight:'500',width:'100%',textAlign:'center',fontSize:'2vw',margin:0}} >Can't find that page.</p>
      <img src='/assets/imgs/ghost404.svg' style={{width:'15vw',margin:'0 0 0 2vw'}} />
    </div>
  );
};

export default NF;