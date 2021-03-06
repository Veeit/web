import React, { Component } from "react";
import PageNavigation from "~/components/ui/PageNavigation";
import "./index.scss";
import StdPageSidebar from "~/components/sidebar/std-page";

export default class StdPageLayout extends Component {
    defaultProps = {
        withSidebar: true
    };

    render() {
        const props = this.props;

        return (
            <>
                <PageNavigation
                    end={props.navRight ? props.navRight : null}
                    title={props.title}
                >
                    {props.nav}
                </PageNavigation>
                {props.fullWidth ? (
                    this.props.children
                ) : (
                    <div className="StdPage container grid-c-s">
                        <div>{props.children}</div>
                        {this.props.withSidebar ? (
                            <div>
                                {this.props.sidebar ? (
                                    this.props.sidebar
                                ) : (
                                    <StdPageSidebar />
                                )}
                            </div>
                        ) : null}
                    </div>
                )}
            </>
        );
    }
}
