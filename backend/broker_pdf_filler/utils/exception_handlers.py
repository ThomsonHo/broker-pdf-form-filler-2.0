from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """Custom exception handler for the API."""
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    # If response is None, there was an unhandled exception
    if response is None:
        if isinstance(exc, AssertionError):
            data = {
                'error': 'Validation Error',
                'detail': str(exc),
                'code': 'validation_error'
            }
            return Response(data, status=status.HTTP_400_BAD_REQUEST)
        
        # For any other unhandled exception
        data = {
            'error': 'Server Error',
            'detail': 'An unexpected error occurred.',
            'code': 'server_error'
        }
        return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Add additional information to the response
    if not isinstance(response.data, dict):
        response.data = {'detail': response.data}
    
    response.data['code'] = response.status_code
    
    return response 