import React, { Component } from "react";
import NavLink from "~/components/ActiveLink";
import PageNavigation from "~/components/ui/PageNavigation";

class CompanyPageLayout extends Component {
    render() {
        return (
            <>
                <PageNavigation title={"About"}>
                    <NavLink route="about" activeClassName="is-active">
                        <a className="navbar-item">Company</a>
                    </NavLink>
                    <NavLink route="faq" activeClassName="is-active">
                        <a className="navbar-item">FAQ</a>
                    </NavLink>
                    <NavLink route="legal" activeClassName="is-active">
                        <a className="navbar-item">Legal</a>
                    </NavLink>
                    <NavLink route="contact" activeClassName="is-active">
                        <a className="navbar-item">Contact</a>
                    </NavLink>
                </PageNavigation>
                {this.props.children}
            </>
        );
    }
}

export default CompanyPageLayout;
