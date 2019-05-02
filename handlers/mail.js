const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmltoText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
});

// TEMP Test email sending
transport.sendMail({
  from: 'Wes Bos <wesbos@gmail.com>',
  to: 'an@example.com',
  subject: 'Testing testing...',
  html: '<strong>Woop</strong>de<strong>woop</strong>',
  text: '**Woop** de **woop**'
});
