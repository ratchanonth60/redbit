# redbit
# สร้าง Private Key (เก็บไว้เป็นความลับ!)
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

# สร้าง Public Key จาก Private Key
openssl rsa -pubout -in private_key.pem -out public_key.pem
