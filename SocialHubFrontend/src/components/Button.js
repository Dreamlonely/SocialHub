import React from "react";

function Button({ label, onClick, type = "button", className = "" }){
    return (
        <button
        type={type}
        onClick={onClick}
        >{label}
        </button>
    );
}

export default Button;