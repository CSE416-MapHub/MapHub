"use client" // TODO: remove thid

import EditorRibbon from "./ui/components/EditorRibbon";
import Properties from "./ui/components/Property";



export default function() {
    return (
        <>
            <EditorRibbon />
            lorem upsim 
            <Properties panels={[
                {
                    name: "Labels",
                    items: [{
                        name: "ISO_NAME",
                        input: {
                            type: "text",
                            short: false,
                            disabled: false,
                            value: "CHAD"
                        }
                    }]
                },
                {
                    name: "Colors",
                    items: [{
                        name: "Feature Color",
                        input: {
                            type: "color",
                            short: true,
                            disabled: false,
                            value: "#FFFFFF"
                        }
                    }]
                }
            ]}/>
        </>
        
        
    )
}