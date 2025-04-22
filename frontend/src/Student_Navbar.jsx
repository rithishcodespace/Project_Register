import React from 'react'
import college_img from "./assets/college_img.png"
import logout from "./assets/logout.webp"

function Student_navbar() {
  return (
    <div style={{width:"15%",height:"100vh",backgroundColor:"white",textAlign:"center"}}>
      <img src={college_img} style={{width:"50%",marginTop:"10%", backgroundColor:"white",zIndex:1}} alt="" />
      <div><img src={logout} style={{width:"15%"}} alt="" /><p>Dashboard</p></div>
      <div><img src={logout} style={{width:"15%"}} alt="" /><p>Dashboard</p></div>
      <div><img src={logout} style={{width:"15%"}} alt="" /><p>Dashboard</p></div>
      <div><img src={logout} style={{width:"15%"}} alt="" /><p>Dashboard</p></div>
      <div><img src={logout} style={{width:"15%"}} alt="" /><p>Dashboard</p></div>

      <div style={{backgroundColor:"white",marginBottom:"10px"}}><img src={logout} alt="" style={{width:"15%",backgroundColor:"white",color:"rgb(158, 67, 255);"}} /></div>
    </div>
  )
}

export default Student_navbar