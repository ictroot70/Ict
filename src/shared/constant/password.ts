export const PASSWORD_REGEX =
  /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/

export const PASSWORD_ALLOWED_CHARACTERS = `0-9, a-z, A-Z, ! "
# $ % & ' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^
_\` { | } ~`

export const PASSWORD_COMPLEXITY_REQUIREMENTS =
  'at least one digit, one lowercase letter, one uppercase letter, and one special character'
