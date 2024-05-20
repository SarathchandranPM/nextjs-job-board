import prisma from "@/lib/prisma";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Select from "./ui/select";
import { jobTypes } from "@/lib/job-types";
import { Button } from "./ui/button";
import { jobFilterSchema } from "@/lib/validation";
import { redirect } from "next/navigation";

async function filterJobs(formData: FormData) {
  "use server";

  /*
 console.log(formData);
 
 Suppose you typed "microsoft" in the Search field, selected "Temporary" from Type and selected "Redmond, Washington, United States" from Location, your formData will look like:

  FormData {
  [Symbol(state)]: [
    {
      name: '$ACTION_ID_1ba9fa1e6d7964a38155cd29ce1c1f2e1cd48bce',
      value: ''
    },
    { name: 'query', value: 'microsoft' },
    { name: 'type', value: 'Temporary' },
    { name: 'location', value: 'Redmond, Washington, United States' }
  ]
}

To access any particular form field you can use the form.get() method:

  console.log(formData.get("query")); // microsoft
  console.log(formData.get("type")); // Temporary
  console.log(formData.get("location")); // Redmond, Washington, United States
 */

  const values = Object.fromEntries(formData.entries());

  /*
  console.log(values); 

  If you log the values object, you can see this:

  {
  '$ACTION_ID_1ba9fa1e6d7964a38155cd29ce1c1f2e1cd48bce': '',
  query: 'microsoft',
  type: 'Temporary',
  location: 'Cupertino, California, United States'
  }
  */

  const { query, type, location, remote } = jobFilterSchema.parse(values);

  /*
  const searchParams = new URLSearchParams({
    ...(query && { query: query.trim() }),
    ...(type && { type: type }),
    ...(location && { location: location }),
    ...(remote && { remote: "true" }),
  });
  */

  // You can also write like this, since for type and location the kay and value are same:

  const searchParams = new URLSearchParams({
    ...(query && { query: query.trim() }),
    ...(type && { type }),
    ...(location && { location }),
    ...(remote && { remote: "true" }),
  });

  redirect(`/?${searchParams.toString()}.`);

  /*
  For example:
  console.log(searchParams.toString()); // /?query=microsoft&type=Temporary&location=Cupertino%2C+California%2C+United+States.
  */
}

const JobFilterSidebar = async () => {
  const distinctLocations = await prisma.job.findMany({
    where: { approved: true },
    select: { location: true },
    distinct: ["location"],
  });

  const filteredLocations = distinctLocations
    .map(({ location }) => location)
    .filter(Boolean) as string[];

  /*
  Alternate approach:

  const distinctLocation = await prisma.job
    .findMany({
      where: { approved: true },
      select: { location: true },
      distinct: ["location"],
    })
    .then(
      (location) =>
        location.map(({ location }) => location).filter(Boolean) as string[],
    );
*/
  return (
    <aside className="0 sticky top-0 h-fit rounded-lg border bg-background p-4 md:w-[260px]">
      <form action={filterJobs}>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="query">Search</Label>
            <Input id="query" name="query" placeholder="Title, company, etc." />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Type</Label>
            <Select id="type" name="type" defaultValue="">
              <option>All types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Location</Label>
            <Select id="location" name="location" defaultValue="">
              <option>All location</option>
              {filteredLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remote"
              name="remote"
              className="scale-125 accent-black"
            />
            <label htmlFor="remote">Remote</label>
          </div>
          <Button type="submit" className="w-full">
            Find jobs
          </Button>
        </div>
      </form>
    </aside>
  );
};
export default JobFilterSidebar;

/*
h-fit class is applied to the aside so that this element's height will adjust according to the content inside it.  Also this is essential for sticky class to work.
*/

/*
If you're using the alternate approach, replace filteredLocations for distinctLocation while mapping:

{
  distinctLocation.map((location) => (
    <option key={location} value={location}>
      {location}
    </option>
  ));
}

*/

/*
Why the  "use server" directive???

If you run the code without the "use server" directive in filterJobs function you'll encounter the below error:

Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.

The error message you received is related to the way React Server Components work in Next.js.

In your code, you're passing the filterJobs function as the action prop to the <form> element. However, since filterJobs is an async function, it is considered a Server Component, and it cannot be directly passed to a Client Component (in this case, the <form> element).

In React, the <form> element is considered a Client Component because it is part of the standard HTML elements rendered on the browser (client-side). Client Components are components that are rendered on the client-side (in the browser) and can interact with the DOM and handle user events (such as form submissions).
*/

/*
distinct: ["location"]: This is the key part for filtering distinct locations. It tells Prisma to return only unique values for the "location" field. Duplicate locations will be eliminated from the results.

The value assigned to distinctLocation will be an array of objects, where each object contains only the "location" field with a unique value.
*/

/*
If you're using the alternate approach:

The .then block is executed after the findMany query successfully retrieves data from the database. This means the locations parameter passed to the callback function will be an array of objects, where each object contains only the "location" field with a unique value.

Let's discuss what this logic is for:

For example, if the database had three jobs with locations "San Francisco", "New York City", and "San Francisco" (duplicate), the locations array would look like this:

[ { location: "San Francisco" }, { location: "New York City" } ]
*/

/*
The findMany operation will return an array of objects, where each object has a location property. Some of these location values might be null, undefined, or other falsy values like an empty string "":

[
  { location: "Ottawa" },
  { location: "California" },
  { location: null },
  { location: "New York" },
  { location: undefined },
  { location: "" }
]

.map(({ location }) => location): This line uses the map function to iterate through the locations array and extract the "location" values. It destructures each object to access the "location" property and then returns that value. After the map operation, the array looks like:

["ottawa", "california", null, "new york", undefined, ""]

.filter(Boolean): This part applies a filter using the filter function. It keeps only the elements that evaluate to true when cast to a boolean value. The filter(Boolean) removes all falsy values (null, undefined, ""), resulting in:

["ottawa", "california", "new york"]

*/

/*
as string[]
It tells the compiler to treat the final result as an array of strings (string[]).

If you remove the type assertion, you will see an error under 
value={location} in below part:

{
  filteredLocations.map((location) => (
    <option key={location} value={location}>
      {location}
    </option>
  ));
}

And the error says:

Type 'string | null' is not assignable to type 'string | number | readonly string[] | undefined'.
Type 'null' is not assignable to type 'string | number | readonly string[] | undefined'.

The error you're encountering is due to the fact that the filter(Boolean) operation doesn't guarantee that the resulting array will only contain strings. It removes all falsy values, including null and undefined, but it doesn't prevent other types from being included.

In your case, the distinctLocations array is expected to contain objects with a location property, which could be a string or null. After the map and filter operations, the resulting filteredLocations array could potentially contain both strings and null values.
When you map over filteredLocations to create the <option> elements, React expects the value prop to be of type string | number | readonly string[] | undefined. However, since filteredLocations might contain null values, React throws an error because null is not assignable to the expected types for the value prop.

The filter(Boolean) is not useless, but it serves a specific purpose that may not be immediately apparent in this particular case. However, filter(Boolean) alone is not sufficient to guarantee that the resulting array contains only string values, as it doesn't filter out null values explicitly. 

This might be necessary for further usage of the distinctLocations variable, depending on how it's used later in your code.
*/

/*
What happens when you click the submit button (Find jobs button)..?

When you click the button, you are submitting the form. And when the form is submitted, it will store all the values in the formData.
*/
