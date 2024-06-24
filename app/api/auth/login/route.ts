export async function POST(request: NextRequest) {
    const jsonBody = await request.json();
    const userDTO = new UserInputDTO(jsonBody);
  
    const errorStates = await validateDTO(userDTO);
    if (errorStates.length > 0) {
      return Response.json(
        { states: errorStates },
        { status: HttpStatus.BAD_REQUEST },
      );
    }
  
    try {
      const user = await userService.create(userDTO);
      return Response.json(user, { status: HttpStatus.CREATED });
    } catch (error: any) {
      const errorState = error.message;
      const statusCode = getHttpStatusFromErrorState(errorState);
  
      return Response.json({ state: errorState }, { status: statusCode });
    }
  }
  