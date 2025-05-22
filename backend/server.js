import sql from './db.js'


async function getUsersOver(age) {
    const users = await sql`
    select *
    from bloodbank.location
    
  `
    return users
}

// Use an IIFE to await the async function
; (async () => {
    try {
        const users = await getUsersOver(30)
        console.log(users)
    } catch (err) {
        console.error(err)
    }
})()