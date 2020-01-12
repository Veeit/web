import React from "react";
import "./index.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OutboundLink from "~/components/OutboundLink";
import Head from "~/components/Head";

export default props => (
    <div className={"DownOverlay"}>
        <Head />
        <img src="https://images.emojiterra.com/google/android-10/512px/1f96d.png" />
        <h2 className={"brand"}>Makerlog</h2>
        <div className={"center has-text-centered"}>
            <h1>Uh oh, something went wrong.</h1>
            <p>Makerlog is a little overloaded or down due to maintenance.</p>
            <br />
            <div className={"button-row"}>
                <div>
                    <OutboundLink
                        className={"button is-text"}
                        href={"https://twitter.com/getmakerlog"}
                    >
                        <FontAwesomeIcon
                            color={"#3498db"}
                            icon={["fab", "twitter"]}
                        />{" "}
                        <span className={"has-text-grey"}>Check Twitter</span>
                    </OutboundLink>
                </div>

                <div>
                    <OutboundLink
                        className={"button is-text"}
                        href={"https://t.me/makerlog"}
                    >
                        <FontAwesomeIcon
                            color={"#3498db"}
                            icon={["fab", "telegram"]}
                        />{" "}
                        <span className={"has-text-grey"}>
                            Talk on Telegram
                        </span>
                    </OutboundLink>
                </div>

                <div>
                    <OutboundLink
                        className={"button is-text"}
                        href={"https://status.getmakerlog.com"}
                    >
                        <FontAwesomeIcon
                            color={"#47E0A0"}
                            icon={"check-circle"}
                        />{" "}
                        <span className={"has-text-grey"}>Platform Health</span>
                    </OutboundLink>
                </div>
            </div>
        </div>
    </div>
);