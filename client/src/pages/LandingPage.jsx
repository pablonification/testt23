import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import lingobee from '../assets/logo-lingobee.png';
import itb from '../assets/itb-logo.png';
import lingobee2 from '../assets/logo-lp-lingobee.png';

export default function LandingPage(){
    const navigate = useNavigate();

    return (
        <div className="lp-root">
            <div className="lp-container">
                <header className="lp-header">
                    <img src={lingobee} alt="LingoBee" className="logo-img" />
                    <img src={itb} alt="ITB" className="badge-img" />
                </header>

                <img src={lingobee2} alt="LingoBee" className="logo2-img" />

                <button className="div" onClick={() => navigate('/register')}>
                    <div className="rectable-2" />
                    <div className="text-wrapper-2">Register</div>
                </button>

                <button className="group-2" onClick={() => navigate('/login')}>
                    <div className="rectangle-3" />
                    <div className="text-wrapper-3">Already Have an Account?</div>
                </button>
            </div>
        </div>
    )
}