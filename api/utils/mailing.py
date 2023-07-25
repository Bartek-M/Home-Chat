import os
import smtplib
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from __main__ import ADDR, PORT

from dotenv import load_dotenv
load_dotenv(dotenv_path="./api/.env")

EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")

HTML_BASE = lambda content: f"""
    <!DOCTYPE html>
    <html style="font-family: arial, sans-serif">
        <head>
            <meta name="color-scheme" content="light only">
            <meta name="supported-color-schemes" content="light only">
        </head>
        <body style="background-color: #f9f9f9;">
            <h1 style="margin: 1rem auto; max-width: 640px; text-align: center;">Home Chat</h1>
            <div style="margin: 0 auto; max-width: 640px; padding: 1rem 0; background-color: #FFFFFF;">
                {content}
                <hr style="width: calc(100% - 2rem); border-color: #f9f9f9" />
                <p style="width: calc(100% - 2rem); margin: 1rem; font-size: .75rem; ">
                    Sent by Home Chat
                </p>
            </div>
        </body>
    </html>
"""


class Mailing:
    @staticmethod
    def send_email(dest, subject, messages):
        """
        Send email to a specific address
        :param dest: Destination email
        :param messages: Message to send; Dictionary{"text", "html"}
        :return: None
        """
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = EMAIL
        message["To"] = dest

        message.attach(MIMEText(messages["text"], "plain"))
        message.attach(MIMEText(messages["html"], "html"))

        with smtplib.SMTP("smtp.gmail.com", 587) as s:
            s.starttls()
            s.login(EMAIL, PASSWORD)
            s.sendmail(EMAIL, dest, message.as_string())

    @staticmethod
    def send_verification(email, name, verify_code):
        """
        Generate and send email with verification code
        :param email: User email
        :param name: User name
        :param verify_code: User verification code
        :return: None
        """
        subject = f"Your Home Chat email verification code is {verify_code}"

        text = f"""
            Home Chat

            Welcome, {name}!
            Thank you for registering an account in Home Chat!<br />
            Grab this code and log in to activate your account. You have 24 hours to do that - if you don't activate it, your account will be deleted. Of course, you can register your account again.

            Code: {verify_code}

            Don't share this code with anyone.
            If you didn't ask for this code please ignore this email.

            Sent by Home Chat
        """

        html = HTML_BASE(f"""
            <h2 style="width: calc(100% - 2rem); margin: 0 1rem;">Welcome, {name}!</h2>
            <p style="width: calc(100% - 2rem); margin: 1rem; line-height: 1.5rem;">
                Thank you for registering an account in Home Chat!<br />
                Grab this code and log in to activate your account. You have 24 hours to do that - if you don't activate it, your account will be deleted. Of course, you can register your account again.
            </p>
            <div style="width: calc(100% - 4rem); margin: 2rem 1rem; padding: 1rem; text-align: center; background-color: #f2f3f4;">
                <h2 style="margin: 0">{verify_code}</h2>
            </div>
            <p style="width: calc(100% - 2rem); margin: 1rem; line-height: 1.5rem;">
                Don't share this code with anyone.<br />
                If you didn't ask for this code please ignore this email.
            </p>
        """)

        email_thread = threading.Thread(target=Mailing.send_email, args=(email, subject, {"text": text, "html": html}))
        email_thread.start()
        
    @staticmethod
    def send_email_verification(email, name, ticket):
        """
        Generate and send email with email change verification
        :param email: User email
        :param name: User name
        :param ticket: Ticket for later authorization
        :return: None
        """
        subject = "Verify Email Address for Home Chat"

        text = f"""
        Home Chat

        Hey, {name}!
        You wanted to change your email to this one. Click below to finish the transition process:

        http://{ADDR}:{PORT}/api/auth/confirm-email?ticket={ticket}

        If this email wasn't meant for you please ignore it.

        Sent by Home Chat
        """

        html = HTML_BASE(f"""
            <h2 style="width: calc(100% - 2rem); margin: 0 1rem;">Hey, {name}!</h2>
            <p style="width: calc(100% - 2rem); margin: 1rem; line-height: 1.5rem;">
                You wanted to change your email to this one. Click below to finish the transition process:
            </p>
            <div style="width: calc(100% - 4rem); margin: 2rem 1rem; padding: 1rem; text-align: center">
                <a style="color: 1167b1; text-decoration: none;" href="http://{ADDR}:{PORT}/api/auth/confirm-email?ticket={ticket}">Confirm Email</a>
            </div>
            <p style="width: calc(100% - 2rem); margin: 1rem; line-height: 1.5rem;">If this email wasn't meant for you please ignore it.</p>
        """)
        
        email_thread = threading.Thread(target=Mailing.send_email, args=(email, subject, {"text": text, "html": html}))
        email_thread.start()

    @staticmethod
    def send_email_recovery(email, new_email, name, ticket):
        """
        Generate and send email with recovery after email was changed
        :param email: User email
        :param new_email: New user email
        :param name: User name
        :param ticket: Ticket for later authorization
        :return: None
        """
        subject = "Email Recovery for Home Chat"

        text = f"""
        Home Chat

        Hey, {name}!
        Someone has changed your email address to '{new_email}'. Click below to restore your earlier email:

        http://{ADDR}:{PORT}/api/recovery/email?ticket={ticket}

        If you don't recognize this action, change your password immediately.
        
        Sent by Home Chat
        """

        html = HTML_BASE(f"""
            <h2 style="width: calc(100% - 2rem); margin: 0 1rem;">Hey, {name}!</h2>
            <p style="width: calc(100% - 2rem); margin: 1rem; line-height: 1.5rem;">
                Someone has changed your email address to '{new_email}'. Click below to restore your earlier email:
            </p>
            <div style="width: calc(100% - 4rem); margin: 2rem 1rem; padding: 1rem; text-align: center">
                <a style="color: 1167b1; text-decoration: none;" href="http://{ADDR}:{PORT}/api/recovery/email?ticket={ticket}">Restore Email</a>
            </div>
            <p style="width: calc(100% - 2rem); margin: 1rem; line-height: 1.5rem;">If you don't recognize this action, change your password immediately.</p>
        """)

        email_thread = threading.Thread(target=Mailing.send_email, args=(email, subject, {"text": text, "html": html}))
        email_thread.start()

    @staticmethod
    def send_password_recovery(email, name, ticket):
        """
        Generate and send email with password recovery after user forgot it
        :param email: User email
        :param name: User name
        :param ticket: Ticket for later authorization
        :return: None
        """
        subject = "Password Recovery for Home Chat"

        text = f"""

        """

        html = HTML_BASE(f"""

        """)

        email_thread = threading.Thread(target=Mailing.send_email, args=(email, subject, {"text": text, "html": html}))
        email_thread.start()