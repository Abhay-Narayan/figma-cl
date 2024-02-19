'use client'
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@/liveblocks.config"
import LiveCursors from "./cursor/LiveCursors"
import { useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";

const Live = () => {
    const broadcast= useBroadcastEvent();
    const others = useOthers();
    const [cursorState, setCursorState] = useState<CursorState>({
        mode: CursorMode.Hidden,
    })
    const [{cursor}, updateMyPresence]= useMyPresence() as any;

    const [reactions, setReactions] = useState<Reaction[]>([])

    const setReaction = useCallback((reaction: string) => {
        setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
      }, []);

    useInterval(() => {
        setReactions((reactions) => reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000));
      }, 1000);

      useInterval(() => {
        if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
          // concat all the reactions created on mouse click
          setReactions((reactions) =>
            reactions.concat([
              {
                point: { x: cursor.x, y: cursor.y },
                value: cursorState.reaction,
                timestamp: Date.now(),
              },
            ])
          );
    
          // Broadcast the reaction to other users
          broadcast({
            x: cursor.x,
            y: cursor.y,
            value: cursorState.reaction,
          });
        }
      }, 100);
    
    useEventListener((eventData) => {
        const event = eventData.event as ReactionEvent;
        setReactions((reactions) =>
          reactions.concat([
            {
              point: { x: event.x, y: event.y },
              value: event.value,
              timestamp: Date.now(),
            },
          ])
        );
    });
    
    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent) => {
          if (e.key === "/") {
            setCursorState({
              mode: CursorMode.Chat,
              previousMessage: null,
              message: "",
            });
          } else if (e.key === "Escape") {
            updateMyPresence({ message: "" });
            setCursorState({ mode: CursorMode.Hidden });
          } else if (e.key === "e") {
            setCursorState({ mode: CursorMode.ReactionSelector });
          }
        };
    
        const onKeyDown = (e: KeyboardEvent) => {
          if (e.key === "/") {
            e.preventDefault();
          }
        };
    
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("keydown", onKeyDown);
    
        return () => {
          window.removeEventListener("keyup", onKeyUp);
          window.removeEventListener("keydown", onKeyDown);
        };
    }, [updateMyPresence]);
    

    const handlePointerMove=useCallback((event:React.PointerEvent)=>{
        event.preventDefault();
        if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector){
        const x= event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y= event.clientY - event.currentTarget.getBoundingClientRect().y;
        updateMyPresence({cursor:{x,y}});
        }

    },[])

    const handlePointerLeave=useCallback((event:React.PointerEvent)=>{
        setCursorState({mode:CursorMode.Hidden})
        updateMyPresence({cursor:null, message:null});
    },[])

    const handlePointerDown=useCallback((event:React.PointerEvent)=>{
        const x= event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y= event.clientY - event.currentTarget.getBoundingClientRect().y;

        updateMyPresence({cursor:{x,y}});
        setCursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
        );
    },[cursorState.mode, setCursorState])

    const handlePointerUp = useCallback(() => {
        setCursorState((state: CursorState) =>
          cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state
        );
      }, [cursorState.mode, setCursorState]);
    //console.log(reactions)

  return (
    <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="h-[100vh] w-full flex justify-center items-center text-center"
    >
        <h1 className="text-2xl text-white">Liveblocks figma clone</h1>
        {reactions.map((reaction) => (
          <FlyingReaction
            key={reaction.timestamp.toString()}
            x={reaction.point.x}
            y={reaction.point.y}
            timestamp={reaction.timestamp}
            value={reaction.value}
          />
        ))}
        {cursor && (
        <CursorChat
           cursor={cursor}
           setCursorState={setCursorState}
           updateMyPresence={updateMyPresence}
           cursorState={cursorState}
        />
        )}

        {cursorState.mode === CursorMode.ReactionSelector && (
          <ReactionSelector
            setReaction={(reaction) => {
              setReaction(reaction);
            }}
          />
        )}

        <LiveCursors others={others}/>
    </div>
  )
}

export default Live