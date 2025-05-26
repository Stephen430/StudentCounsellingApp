using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using StudentCounsellingApp.Services;

namespace StudentCounsellingApp.ViewComponents
{
    public class UserNameViewComponent : ViewComponent
    {
        private readonly UserService _userService;

        public UserNameViewComponent(UserService userService)
        {
            _userService = userService;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            var fullName = await _userService.GetUserFullNameAsync(HttpContext.User);
            return View("Default", fullName);
        }
    }
}
