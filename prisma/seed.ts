import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient();
async function main() {
    // await prisma.admin.createMany({
    //     data:[{email:'khalilrached058@gmail.com'}]
    // })
}


main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })