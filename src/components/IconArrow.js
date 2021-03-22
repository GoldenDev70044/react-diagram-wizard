import { useEffect, useRef } from 'react';

const IconArrow = (props) => {
  const canvasElem = useRef(null);

  useEffect(() => {
    drawIcon();
  }, [props]);

  const drawIcon = () => {
    const positions = props.data;
    const ctx = canvasElem.current.getContext("2d");
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    ctx.beginPath();
    positions.forEach((position) => {
      canvas_arrow(ctx, position.sx, position.sy, position.ex, position.ey);
    });
    ctx.stroke();
  }

  const canvas_arrow = (context, fromx, fromy, tox, toy) => {
    var headlen = 10; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  }
  
  return (
    <canvas ref={canvasElem} className="icon-arrow"></canvas>
  )
}

export default IconArrow;