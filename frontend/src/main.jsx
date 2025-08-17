import React from "react"
import Map from "./map/map"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import { createRoot } from "react-dom/client";


createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Map />} />
      </Routes>
    </BrowserRouter>
)
