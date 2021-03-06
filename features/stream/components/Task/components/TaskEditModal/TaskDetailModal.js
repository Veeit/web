import React from "react";
import PropTypes from "prop-types";
import Modal from "~/components/Modal";
import { CommentsBox } from "~/features/comments";
import EntryDetail from "../TaskDetail";
import { mapStateToProps } from "~/ducks/user";
import { connect } from "react-redux";

class TaskEditModal extends React.Component {
    render() {
        return (
            <Modal
                open={this.props.open}
                onClose={this.props.onClose}
                background={"transparent"}
                flexDirection={"column"}
                percentWidth={50}
                style={{
                    width: "100%",
                    height: "50%"
                }}
                modalStyles={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
                className="TaskDetailModal"
            >
                <EntryDetail task={this.props.task} />
                <CommentsBox indexUrl={`/tasks/${this.props.task.id}/`} />
            </Modal>
        );
    }
}

TaskEditModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    task: PropTypes.object.isRequired
};

export default connect(mapStateToProps)(TaskEditModal);
