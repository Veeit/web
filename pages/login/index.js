import React from "react";
import "./index.scss";
import AuthModal from "../../features/users/components/AuthModal";
import { requireUnauthed } from "~/lib/auth";

class LoginPage extends React.Component {
    static async getInitialProps({ query }) {
        const layout = { className: "LoginPage" };

        return { layout, query };
    }

    render() {
        return (
            <div className="container">
                <AuthModal login params={this.props.query} />
            </div>
        );
    }
}

export default requireUnauthed(LoginPage);
