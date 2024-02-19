'use client'
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import { useEffect, useRef } from "react";
import {fabric} from 'fabric'

export default function Page() {
  const canvasRef= useRef<HTMLCanvasElement>(null);
  const fabricRef=useRef<fabric.Canvas | null>(null);
  const isDrawing= useRef(false);

  useEffect(()=>{

  })

  return (
    <main className="h-screen overflow-hidden" >
      <Navbar/>
      <section className="flex h-full flex-row">
      <LeftSidebar/>
      <Live/>
      <RightSidebar/>
      </section>
    </main>
  );
}