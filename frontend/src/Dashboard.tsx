import React, { useEffect, useState } from "react";
import "./Dashboard.scss";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import BarChart from "./components/BarChart";
import Dropdown from "./components/Dropdown";
import i18n from "i18next";

import { Configuration, FrontendApi, Identity, Session } from "@ory/client"

const basePath = "http://localhost:4000" // process.env.REACT_APP_ORY_URL
const ory = new FrontendApi(
    new Configuration({
        basePath,
        baseOptions: {
            withCredentials: true,
        },
    }),
)

interface Props {
    updateTheme: (theme: "system" | "dark" | "light") => void;
}

export default function Dashboard(props: Props) {
    const navigate = useNavigate();
    const [session, setSession] = useState<Session | undefined>();
    const [logoutUrl, setLogoutUrl] = useState<string | undefined>();
    
    const getUserName = (identity?: Identity) =>
        identity?.traits.email || identity?.traits.username || "Unknown";
    
    useEffect(() => {
        ory.toSession()
           .then(({ data }) => {
               console.log("logged in", data);
               
               setSession(data);
               ory.createBrowserLogoutFlow().then(({ data }) => {
                   setLogoutUrl(data.logout_url);
               });
           })
           .catch((err) => {
               console.error(err);
               // window.location.replace(`${ basePath }/ui/login`);
           });
        
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);
    
    const onKeyDown = (e: any) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
            toggleSearch();
            e.preventDefault();
        }
        
        if (e.key === "Escape") {
            const search = document.querySelector(".search");
            if (search && search.classList.contains("active")) {
                toggleSearch();
            }
        }
    }
    
    const capitalizeFirstLetter = (string: string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    const toggleSearch = () => {
        const search = document.querySelector(".search");
        if (search) {
            let isActive = search.classList.contains("active");
            search.classList.toggle("active");
            
            let keyframes = [
                { transform: "scale(125%)" },
                { transform: "scale(100%)" }
            ]
            
            let duration = 200;
            let easing = "ease-in-out";
            
            if (isActive) {
                search.querySelector("div.search-container")!.animate(keyframes.reverse(), {
                    duration,
                    easing,
                    fill: "both"
                }).onfinish = () => {
                    // @ts-ignore
                    search.style.display = "none"
                };
                
                const searchBar = document.getElementById("search-bar");
                if (searchBar) searchBar.focus();
            } else {
                // @ts-ignore
                search.style.display = "flex";
                
                search.querySelector("div.search-container")!.animate(keyframes, {
                    duration,
                    easing,
                    fill: "both"
                });
                
                const input = search.querySelector("input");
                if (input) input.focus();
            }
        }
    }
    
    const getSearchShortcut = () => {
        let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        let isLinux = navigator.platform.toUpperCase().indexOf('LINUX') >= 0;
        
        return <span className={ "caption" } style={ {
            marginLeft: "var(--spacing)",
            background: "var(--font-color)",
            color: "var(--background-color-primary)",
            borderRadius: "var(--border-radius)",
            paddingInline: "calc(var(--spacing) / 2)"
        } }>
            { isMac ? "⌘K" : isLinux ? "Alt + K" : "Ctrl + K" }
        </span>;
    }
    
    const loggedInDropdown = () => {
        return <Dropdown button={ <div style={ {
            aspectRatio: "1",
            display: "grid",
            placeItems: "center",
            userSelect: "none",
            cursor: "pointer",
            borderRadius: "50%",
            boxShadow: "var(--box-shadow)"
        } }
                                       tabIndex={ 0 }>
            <img className={ "avatar" }
                 src={ "https://benniloidl.de/static/media/me.6c5597f7d72f68a1e83c.jpeg" }
                 alt={ "Benni Loidl" }/>
        </div> }
                         items={ [
                             {
                                 icon: "far fa-user",
                                 label: "Benni Loidl",
                                 shortcut: <span className={ "badge" }>Pro</span>,
                                 onClick: () => navigate("/dashboard/profile")
                             },
                             {
                                 icon: "fas fa-language",
                                 label: "Language",
                                 shortcut: i18n.language,
                                 items: [
                                     {
                                         icon: "fas fa-globe",
                                         label: "English",
                                         onClick: () => i18n.changeLanguage("en"),
                                         shortcut: i18n.language === "en" ?
                                             <i className={ "fas fa-check" }/> : ""
                                     },
                                     {
                                         icon: "fas fa-globe",
                                         label: "German",
                                         onClick: () => i18n.changeLanguage("de"),
                                         shortcut: i18n.language === "de" ?
                                             <i className={ "fas fa-check" }/> : ""
                                     }
                                 ]
                             },
                             {
                                 icon: "fas fa-brush",
                                 label: "Theme",
                                 shortcut: capitalizeFirstLetter(localStorage.getItem("theme") || "system"),
                                 items: [
                                     {
                                         icon: "fas fa-adjust",
                                         label: "System",
                                         onClick: () => props.updateTheme("system"),
                                         shortcut: !localStorage.getItem("theme") ?
                                             <i className={ "fas fa-check" }/> : ""
                                     },
                                     {
                                         icon: "fas fa-moon",
                                         label: "Dark",
                                         onClick: () => props.updateTheme("dark"),
                                         shortcut: localStorage.getItem("theme") === "dark" ?
                                             <i className={ "fas fa-check" }/> : ""
                                     },
                                     {
                                         icon: "fas fa-sun",
                                         label: "Light",
                                         onClick: () => props.updateTheme("light"),
                                         shortcut: localStorage.getItem("theme") === "light" ?
                                             <i className={ "fas fa-check" }/> : ""
                                     }
                                 ]
                             },
                             {
                                 icon: "fas fa-cog",
                                 label: "Settings"
                             },
                             {
                                 icon: "fas fa-sign-out-alt",
                                 label: "Logout"
                             }
                         ] }/>
    }
    
    return <div className={ "dashboard" }>
        <nav>
            <div style={ { position: "relative" } }>
                <button className={ "btn btn-primary" }
                        style={ { outlineColor: "var(--primary-color-contrast)" } }
                        onClick={ () => navigate("/") }><span>simpleQ</span></button>
                <i className={ "fas fa-x toggle-nav" }
                   style={ {
                       fontSize: "1.5em",
                       cursor: "pointer",
                       position: "absolute",
                       right: "var(--spacing)",
                       outlineColor: "var(--primary-color-contrast)",
                       borderRadius: "var(--border-radius)",
                       outlineOffset: "calc(var(--spacing) / 2)"
                   } }
                   tabIndex={ 0 }
                   onClick={ (e) => {
                       let elem = document.querySelector("#toggle-nav-close-ref");
                       if (elem) (elem as HTMLElement).focus();
                   } }
                   onKeyDown={ (e) => {
                       if (e.key === "Enter") {
                           let elem = document.querySelector("#toggle-nav-close-ref");
                           if (elem) (elem as HTMLElement).focus();
                       }
                   } }
                />
            </div>
            
            <NavLink to={ "trending" }><i className={ "fas fa-chart-line" }/>Trending Questions</NavLink>
            <NavLink to={ "question/new" }><i className={ "far fa-edit" }/>Ask Something</NavLink>
            <NavLink to={ "activity" }><i className={ "fas fa-fire" }/>My Activity</NavLink>
            <NavLink to={ "b" }><i className={ "fas fa-star" }/>My Favorites</NavLink>
            <NavLink to={ "c" }><i className={ "fas fa-gift" }/>Daily Quests</NavLink>
            <NavLink to={ "d" }><i className={ "fas fa-bell" }/>Inbox<span className={ "badge" }>3</span></NavLink>
            
            <div style={ { paddingInline: "var(--spacing)" } }>
                <hr/>
            </div>
            
            <NavLink to={
                logoutUrl
                    ? (logoutUrl + (logoutUrl.includes("?") ? "&" : "?") + "return_to=" + encodeURIComponent(window.location.href))
                    : "/"
            }><i className={ "fas fa-gift" }/>{ getUserName(session?.identity) }
            </NavLink>
            
            { window.location.pathname.includes("/question") && <>
                <div style={ { paddingInline: "var(--spacing)" } }>
                    <hr/>
                </div>
                
                <NavLink to="question/1"><i className={ "far fa-question" }/><p
                    style={ { display: "flex", flexDirection: "column" } }>
                    <span className={ "caption" }>Browsing Question</span>
                    <span>How to execute..</span>
                </p></NavLink>
            </> }
            
            <div style={ { flex: 1 } }/>
            <div style={ { paddingInline: "var(--spacing)" } }>
                <hr/>
                <p className={ "caption" } style={ { textAlign: "center", marginBottom: "var(--spacing)" } }>
                    My Stats
                </p>
                <div className={ "stats" }>
                    <div className={ "stats-column" }>
                        <i className={ "fas fa-fire primary-icon" }/>
                        <span>253d</span>
                    </div>
                    <div className={ "stats-column" }>
                        <i className={ "fas fa-eye primary-icon" }/>
                        <span>1.8k</span>
                    </div>
                    <div className={ "stats-column" }>
                        <i className={ "fas fa-thumbs-up primary-icon" }/>
                        <span>1.1k</span>
                    </div>
                </div>
                
                <hr/>
                <p className={ "caption" } style={ { textAlign: "center", marginBottom: "var(--spacing)" } }>
                    Recent Activity
                </p>
                <BarChart data={
                    Array.from({ length: 30 }, () => Math.floor(Math.random() * 100))
                }/>
            </div>
        </nav>
        
        <main>
            <div className={ "container transparent top-bar" }>
                <i className={ "fas fa-bars glass toggle-nav" }
                   id={ "toggle-nav-close-ref" }
                   style={ { fontSize: "1.5em", cursor: "pointer" } }
                   tabIndex={ 0 }
                   onClick={ () => {
                       let elem = document.querySelector("nav a.active");
                       if (elem) (elem as HTMLElement).focus();
                       else elem = document.querySelector("nav a");
                       if (elem) (elem as HTMLElement).focus();
                   } }
                   onKeyDown={ (e) => {
                       if (e.key === "Enter") {
                           let elem = document.querySelector("nav a.active");
                           if (elem) (elem as HTMLElement).focus();
                           else elem = document.querySelector("nav a");
                           if (elem) (elem as HTMLElement).focus();
                       }
                   } }
                />
                
                <p className={ "glass" }
                   onKeyDown={ (e) => {
                       if (e.key === "Enter") toggleSearch();
                   } }
                   id={ "search-bar" }
                   tabIndex={ 0 }
                   onClick={ () => toggleSearch() }>
                    <i className={ "fas fa-magnifying-glass" }/>
                    <span style={ {
                        display: "flex",
                        alignItems: "center"
                    } }>Search.. { getSearchShortcut() }</span>
                </p>
                
                { session !== undefined
                    ? loggedInDropdown()
                    : <button className={ "btn btn-primary" }
                              onClick={ () => window.location.replace(`${ basePath }/ui/login?return_to=` + encodeURIComponent(window.location.href)) }>
                        <i className={ "fas fa-sign-in-alt" }/>
                        <span>Login</span>
                    </button> }
            </div>
            
            <hr style={ { marginBlock: "0" } }/>
            
            <Outlet/>
        </main>
        
        <div className={ "search glass" }
             onClick={ () => toggleSearch() }>
            <div className={ "search-container" }>
                <div onClick={ (e: any) => e.stopPropagation() }>
                    <i className={ "fas fa-magnifying-glass" }/>
                    <input type={ "text" } placeholder={ "Search.." }/>
                </div>
                
                <p className={ "search-info" }>
                    Navigate using <span>↑</span> and <span>↓</span> or <span>{ "\u21B9" }</span>. Select
                    using <span>↵</span>.
                </p>
                
                <p className={ "search-result" } tabIndex={ 0 }>
                    <i className={ "far fa-question badge" }/>
                    <span>How to use React?</span>
                    <div>
                        <i className={ "far fa-user" } style={ { marginRight: "calc(var(--spacing) / 2)" } }/>
                        <span>Benni Loidl</span>
                    </div>
                    <span>Yesterday</span>
                </p>
            </div>
        </div>
    </div>
}
