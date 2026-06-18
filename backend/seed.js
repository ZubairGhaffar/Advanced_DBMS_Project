require('dotenv').config();
const db = require('./src/config/db');
const oracledb = require('oracledb');

async function main() {
  console.log('Starting seed operations...');
  const conn = await db.getConnection();
  try {
    // 1. Seed Hostels
    const hostels = [
      { name: 'Jinnah Hall', total: 100, available: 100 },
      { name: 'Iqbal Hall', total: 80, available: 80 },
      { name: 'Fatima Hall', total: 120, available: 120 }
    ];

    for (const h of hostels) {
      const sql = `
        INSERT INTO hostels (hostel_name, total_rooms, available_rooms)
        SELECT :name, :total, :available FROM DUAL
        WHERE NOT EXISTS (SELECT 1 FROM hostels WHERE hostel_name = :name)
      `;
      await conn.execute(sql, { name: h.name, total: h.total, available: h.available });
    }
    console.log('Hostels seeded.');

    // 2. Seed Library Books
    const books = [
      { title: 'Modern Operating Systems', author: 'Andrew S. Tanenbaum', isbn: '9780133591620', type: 'Book', total: 10, available: 10, publisher: 'Pearson', year: 2014, pages: 1136 },
      { title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '9780073523323', type: 'Book', total: 8, available: 8, publisher: 'McGraw-Hill', year: 2010, pages: 1376 },
      { title: 'Computer Networking', author: 'James Kurose', isbn: '9780133594140', type: 'Book', total: 6, available: 6, publisher: 'Pearson', year: 2016, pages: 864 },
      { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '9780262033848', type: 'Book', total: 12, available: 12, publisher: 'MIT Press', year: 2009, pages: 1312 },
      { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', type: 'Book', total: 15, available: 15, publisher: 'Prentice Hall', year: 2008, pages: 464 },
      { title: 'Design Patterns', author: 'Erich Gamma', isbn: '9780201633610', type: 'Book', total: 5, available: 5, publisher: 'Addison-Wesley', year: 1994, pages: 395 },
      { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', isbn: '9780136042594', type: 'Book', total: 4, available: 4, publisher: 'Pearson', year: 2009, pages: 1152 },
      { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '9780135957059', type: 'Book', total: 10, available: 10, publisher: 'Addison-Wesley', year: 2019, pages: 352 }
    ];

    for (const b of books) {
      const sql = `
        INSERT INTO library_items (title, author, isbn, item_type, total_copies, available_copies, publisher, publish_year, pages)
        SELECT :title, :author, :isbn, :type, :total, :available, :publisher, :year, :pages FROM DUAL
        WHERE NOT EXISTS (SELECT 1 FROM library_items WHERE isbn = :isbn)
      `;
      await conn.execute(sql, {
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        type: b.type,
        total: b.total,
        available: b.available,
        publisher: b.publisher,
        year: b.year,
        pages: b.pages
      });
    }
    console.log('Library books seeded.');

    // 3. Seed Library Issues for Student 1
    const studentRes = await conn.execute(
      `SELECT student_id FROM students WHERE email = 'student1@hitec.edu.pk'`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (studentRes.rows && studentRes.rows.length > 0) {
      const studentID = studentRes.rows[0].STUDENT_ID || studentRes.rows[0].student_id;

      // Get some book IDs
      const booksRes = await conn.execute(
        `SELECT item_id, isbn FROM library_items WHERE isbn IN ('9780133591620', '9780073523323', '9780132350884')`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const bookMap = {};
      booksRes.rows.forEach(r => {
        bookMap[r.ISBN || r.isbn] = r.ITEM_ID || r.item_id;
      });

      const osBookID = bookMap['9780133591620'];
      const dbBookID = bookMap['9780073523323'];
      const ccBookID = bookMap['9780132350884'];

      // Delete existing issues for these to avoid duplicate insert errors if run repeatedly
      await conn.execute(
        `DELETE FROM library_issues WHERE student_id = :studentID AND item_id IN (:osBook, :dbBook, :ccBook)`,
        { studentID, osBook: osBookID, dbBook: dbBookID, ccBook: ccBookID }
      );

      // Insert Returned Book
      await conn.execute(
        `INSERT INTO library_issues (item_id, student_id, issue_date, due_date, return_date, fine_amount, status)
         VALUES (:item_id, :student_id, SYSDATE - 30, SYSDATE - 15, SYSDATE - 10, 100, 'Returned')`,
        { item_id: osBookID, student_id: studentID }
      );

      // Insert Overdue Book
      await conn.execute(
        `INSERT INTO library_issues (item_id, student_id, issue_date, due_date, return_date, fine_amount, status)
         VALUES (:item_id, :student_id, SYSDATE - 15, SYSDATE - 3, NULL, 0, 'Issued')`,
        { item_id: dbBookID, student_id: studentID }
      );
      // Decrement available copies
      await conn.execute(
        `UPDATE library_items SET available_copies = GREATEST(0, available_copies - 1) WHERE item_id = :item_id`,
        { item_id: dbBookID }
      );

      // Insert Active Current Book
      await conn.execute(
        `INSERT INTO library_issues (item_id, student_id, issue_date, due_date, return_date, fine_amount, status)
         VALUES (:item_id, :student_id, SYSDATE - 2, SYSDATE + 12, NULL, 0, 'Issued')`,
        { item_id: ccBookID, student_id: studentID }
      );
      // Decrement available copies
      await conn.execute(
        `UPDATE library_items SET available_copies = GREATEST(0, available_copies - 1) WHERE item_id = :item_id`,
        { item_id: ccBookID }
      );

      console.log('Library borrow issues seeded.');
    } else {
      console.log('Student Ali Khan not found. Skipping issues seeding.');
    }

    await conn.commit();
    console.log('Seeding transaction committed successfully.');
  } catch (err) {
    console.error('Seeding error:', err);
    await conn.rollback();
  } finally {
    try {
      await conn.close();
    } catch (e) {
      console.error(e);
    }
    process.exit(0);
  }
}

main();
