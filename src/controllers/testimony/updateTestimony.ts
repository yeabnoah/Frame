import { Context } from "hono";
import prisma from "../../lib/db";
import getUser from "../../utils/user";

const updateTestimony = async (c: Context) => {
  try {
    const updatedFields = await c.req.json();
    const id = Number(await c.req.param("id"));
    const user = await getUser(c);

    const updatedTestimony = await prisma.testimonial.update({
      where: {
        id: id,
        userId: user?.id,
      },
      data: updatedFields,
    });

    return c.json(updatedTestimony, 200);
  } catch (err) {
    return c.json(
      {
        error: err,
      },
      500
    );
  }
};

export default updateTestimony;
