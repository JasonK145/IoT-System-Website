import type { PropsWithChildren } from 'react';

interface Props{
    onClick(e:any):void;    
}

export default function (props: PropsWithChildren<Props>){
    return (
        <button className="w-1/5 text-center p-2 text-lg border-2 bg-white hover:bg-slate-100 rounded-lg" 
        onClick={(e)=>props.onClick(e)}>
            {props.children}
        </button>
    );
}
