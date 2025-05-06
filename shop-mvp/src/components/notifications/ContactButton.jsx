import React from 'react';
import { Button } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';

const ContactButton = ({ projectId, revealedPhones, hiddenPhone, fullPhone, handleTogglePhone }) => {
    return (
        <>
            <style>
                {`
                    .contact-button {
                        border-radius: 20px;
                        padding: 6px 4px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: none;
                        height: 35px;
                        min-width: 150px;
                        background-color: #00A3AD;
                        color: #ffffff;
                        font-size: 16px;
                        font-weight: 500;
                        line-height: 1;
                        transition: background-color 0.3s ease;
                    }

                    .contact-button:hover {
                        background-color: #008B94;
                        color: #ffffff;
                        cursor: pointer;
                    }

                    .contact-button .anticon {
                        margin-right: 8px;
                        font-size: 18px;
                    }
                `}
            </style>
            <div
                className="contact-button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTogglePhone(projectId);
                }}
                icon={<PhoneOutlined />}
            >
                {revealedPhones[projectId] ? `${revealedPhones[projectId]} - Ẩn` : `${hiddenPhone} - Hiện`}
            </div>
        </>
    );
};

export default ContactButton;