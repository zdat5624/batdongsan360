import React from 'react';
import { Button } from 'react-bootstrap';
import { FaPhone } from 'react-icons/fa';

const ContactButton = ({ projectId, revealedPhones, hiddenPhone, fullPhone, handleTogglePhone }) => {
    return (
        <Button
            className="contact-button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTogglePhone(projectId);
            }}
        >
            <FaPhone />{' '}
            {revealedPhones[projectId] ? `${revealedPhones[projectId]} - Ẩn` : `${hiddenPhone} - Hiện`}
        </Button>
    );
};

export default ContactButton;