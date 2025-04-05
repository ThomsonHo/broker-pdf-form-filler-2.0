from rest_framework import permissions

class IsClientOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a client to access it.
    """
    
    def has_permission(self, request, view):
        # Allow all authenticated users to create clients
        if request.method == 'POST':
            return request.user and request.user.is_authenticated
        
        # For other methods, check object permissions
        return True
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user,
        # but write permissions are only allowed to the owner of the client
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the client
        return obj.user == request.user 