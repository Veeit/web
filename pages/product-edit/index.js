import React, { Component } from "react";
import ProductSettingsPage from "../../layouts/ProductSettingsPage";
import { getProductBySlug } from "../../lib/products";
import { connect } from "react-redux";
import GeneralTab from "~/features/products/components/settings/GeneralTab";
import { requireAuthed } from "~/lib/auth";

class ProductEditPage extends Component {
    state = {
        tab: 0
    };

    switchTab = tab => {
        this.setState({ tab });
    };

    isOwner = () => {
        return this.props.me.id === this.props.product.user;
    };

    isTeammate = () => {
        return this.props.product.team.some(t => t === this.props.me.id);
    };

    getTabProps = () => {
        return {
            me: this.props.me,
            isOwner: this.isOwner(),
            product: this.props.product,
            isTeammate: this.isTeammate()
        };
    };

    static async getInitialProps({ query: { slug }, ...ctx }) {
        let layout = { className: "ProductEditPage" };
        try {
            const product = await getProductBySlug(slug);
            // TODO: check permissions on getInitialProps?
            return {
                product,
                layout: { ...layout }
            };
        } catch (e) {
            if (e.status_code && e.status_code === 404) {
                return {
                    statusCode: 404,
                    ...layout
                };
            } else {
                return {
                    statusCode: 500,
                    ...layout
                };
            }
        }
    }

    render() {
        const { product } = this.props;

        if (!this.isOwner() && !this.isTeammate()) {
            return (
                <div className="container">
                    <div className="alert is-danger">
                        <div className="alert-body">
                            You don't have permission to be here.
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <ProductSettingsPage product={product} switchTab={this.switchTab}>
                {this.state.tab === 0 && <GeneralTab {...this.getTabProps()} />}
            </ProductSettingsPage>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.auth.isLoggedIn,
        me: state.user.me
    };
};

export default connect(mapStateToProps)(requireAuthed(ProductEditPage));
