import bcrypt from 'bcryptjs';

const password = 'baka-tsuki'; //Replace this with your actually desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
        return;
    }
    console.log('Your hashed password is:', hash);
}); 