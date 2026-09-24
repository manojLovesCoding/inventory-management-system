import { hash as _hash } from "bcrypt";

const password = "password";

_hash(password, 10, (err, hash) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(hash);
});