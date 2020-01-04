import React from "react";
import "./index.scss";
import AuthModal from "../../features/users/components/AuthModal";
import { requireUnauthed } from "~/lib/auth";

class RegisterPage extends React.Component {
    static async getInitialProps({ query }) {
        const layout = { className: "RegisterPage" };

        return { layout, query };
    }

    render() {
        return (
            <div className="container">
                <AuthModal begin params={this.props.query} />
            </div>
        );
    }
}

export default requireUnauthed(RegisterPage);
