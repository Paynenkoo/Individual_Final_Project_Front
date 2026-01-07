import reducer, { setUsers } from "../store/slices/usersSlice";

describe("usersSlice", () => {
  it("should handle setUsers", () => {
    const prev = { list: [], loading: false, error: null };
    const next = reducer(prev, setUsers([{ id: "1", username: "test" }]));
    expect(next.list).toHaveLength(1);
    expect(next.list[0].username).toBe("test");
  });
});
