import { Resolver, Query, Mutation, Arg, UseMiddleware, Int } from "type-graphql";
import { Book } from "../../models/Book";
import { CreateBookInput } from "./types/CreateBookInput";
import { UpdateBookInput } from "./types/UpdateBookInput";
import { GqlLog } from "../../utils/middlewares/GqlLogMiddleware";
import { Author } from "../../models/Author";

@Resolver()
export class BookResolver {

  @Query(() => String)
  hello(): string {
    return "world";
  }


  @Query(() => [Book])
  async books(@Arg("limit", { nullable: true }) limit: number,
    @Arg("offset", { nullable: true }) offset: number): Promise<Book[]> {
    let books: Book[];
    books = await Book.find({ relations: ['author'] })
    if (offset && limit) {
      books = books.slice(offset, offset + limit + 1)
    }
    return books
  }


  @Mutation(() => Book)
  @UseMiddleware([GqlLog])
  async createBook(@Arg("data") data: CreateBookInput): Promise<Book> {
    const book = Book.create(data);
    await book.save();
    book.author = await Author.findOne({ where: { id: data.authorId } })
    return book;
  }

  @Query(() => Book)
  @UseMiddleware([GqlLog])
  async book(@Arg("id", () => Int) id: number): Promise<Book> {
    return await Book.findOne({ where: { id } });
  }

  @Mutation(() => Book)
  @UseMiddleware([GqlLog])
  async updateBook(@Arg("id", () => Int) id: number, @Arg("data") data: UpdateBookInput): Promise<Book> {
    const book = await Book.findOne({ where: { id } });
    if (!book) throw new Error("Book not found!");
    book.author = await Author.findOne({ where: { id: data.authorId } })
    delete data.authorId
    Object.assign(book, data);
    const updBook = await book.save();
    return updBook;
  }

  @Mutation(() => Int)
  @UseMiddleware([GqlLog])
  async deleteBook(@Arg("id", () => Int) id: number): Promise<number> {
    const book = await Book.findOne({ where: { id } });
    if (!book) throw new Error("Book not found!");
    await book.remove();
    return id;
  }
}
